"""ORM-модели ReDepict."""
from sqlalchemy import (
    BigInteger, CheckConstraint, Column, DateTime, ForeignKey,
    SmallInteger, String, Text, func, LargeBinary, ForeignKeyConstraint
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from src.redepict.db.base import Base

class User(Base):
    """Пользователь приложения (аккаунт для входа + данные профиля)."""
    __tablename__ = "users"

    # Первичный ключ: уникальный номер пользователя
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    # Никнейм, отображается в интерфейсе
    username = Column(String(50), nullable=False, unique=True)
    # Email используется как логин: по нему ищем пользователя при входе
    email = Column(String(255), nullable=False, unique=True)
    # bcrypt-хэш пароля
    password_hash = Column(String(255), nullable=False)
    # Права доступа: 'user' или 'admin'
    role = Column(String(20), nullable=False, default="user", server_default="user")
    # Уровень навыка рисования из профиля (новичок / любитель / профи) —
    # может учитываться ИИ при анализе, чтобы сортировать строгость оценки
    skill_level = Column(String(50), nullable=True)
    # Инструменты, которыми рисует пользователь
    drawing_tools = Column(String(100), nullable=True)
    # Дата и время регистрации
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # Все рисунки пользователя
    drawings = relationship("Drawing", back_populates="user", cascade="all, delete-orphan")
    # Все сообщения чата, отправленные этим пользователем
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("role IN ('user', 'admin')", name="ck_users_role"),
    )


class Drawing(Base):
    """Загруженный пользователем рисунок и состояние его обработки."""
    __tablename__ = "drawings"

    # Первичный ключ: уникальный номер рисунка
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    # Автор рисунка (ссылка на users.id)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    # Имя бакета объектного хранилища MinIO (S3-совместимого), где лежит файл.
    # Пара (bucket, object_key) = полный адрес файла. Почти всегда это
    # 'redepict-drawings' (настройка MINIO_BUCKET_NAME в config.py),
    # но поле хранится построчно, чтобы не привязывать схему к одному бакету
    bucket = Column(String(50), nullable=False, default="redepict-drawings")
    # Путь к файлу внутри хранилища. Вместе с bucket образует составной внешний
    # ключ на таблицу minio_object, где лежит содержимое файла (см. __table_args__)
    object_key = Column(String(255), nullable=False, unique=True)
    # Прямая ссылка (URL) на картинку — по ней фронтенд показывает изображение
    # в <img src="...">, не выкачивая байты файла через API
    # Может быть относительным путём (/uploads/<имя>.png, раздаётся StaticFiles
    # из main.py) или полным публичным URL MinIO (http://<endpoint>/<bucket>/<key>).
    # NULL, пока ссылка не сформирована
    image_url = Column(String(512), nullable=True)
    # Оригинальное имя файла при загрузке пользователем — показываем в UI
    # и отдаём при скачивании, чтобы имя было понятным человеку
    original_name = Column(String(255), nullable=False)
    # MIME-тип файла (image/png, image/jpeg...) — чтобы браузер корректно
    # отображал файл на экране и при скачивании
    mime_type = Column(String(50), nullable=False)
    # Размер файла в байтах: позволяет показать вес файла в UI и узнать размер,
    # НЕ вычитывая сам бинарник (content) из БД/хранилища
    size_bytes = Column(BigInteger, nullable=False)
    # Техника рисунка, выбранная пользователем —
    # влияет на то, как ИИ анализирует работу
    technique = Column(String(50), nullable=True)
    # Уровень подготовки автора рисунка — влияет на строгость оценки ИИ
    level = Column(String(50), nullable=True)
    # Ключ файла-РЕЗУЛЬТАТА обработки (перерисованный/обработанный вариант рисунка).
    # Заполняется в crud.update_drawing_status после успешной обработки, до этого NULL.
    # Исходный файл адресуется парой (bucket, object_key), результат — этим ключом
    result_object_key = Column(String(255), nullable=True)
    # Стадия жизненного цикла: uploaded -> analyzing -> analyzed | failed
    status = Column(String(20), nullable=False, default="uploaded", server_default="uploaded")
    # Время загрузки рисунка
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # Автор рисунка
    user = relationship("User", back_populates="drawings")
    # Результат анализа
    analysis = relationship("Analysis", back_populates="drawing", uselist=False, cascade="all, delete-orphan")
    # Сообщения чата, привязанные к этому рисунку
    chat_messages = relationship("ChatMessage", back_populates="drawing", cascade="all, delete-orphan")

    # Содержимое файла из таблицы minio_object \
    file = relationship("MinioObject", back_populates="drawing", uselist=False)

    __table_args__ = (
        CheckConstraint("status IN ('uploaded', 'analyzing', 'analyzed', 'failed')", name="ck_drawings_status"),
        ForeignKeyConstraint(
            ["bucket", "object_key"],
            ["minio_object.bucket", "minio_object.object_key"],
            name="fk_drawings_minio_object",
            ondelete="CASCADE"
        ),
    )


class Analysis(Base):
    """Результат ИИ-анализа рисунка (связь 1:1 с Drawing)."""
    __tablename__ = "analyses"

    # Первичный ключ записи анализа
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    # Проанализированный рисунок
    drawing_id = Column(BigInteger, ForeignKey("drawings.id", ondelete="CASCADE"), nullable=False, unique=True)
    # Название модели, которая выполнила анализ
    model = Column(String(50), nullable=False)
    # Итоговая оценка работы от 1 до 10
    score = Column(SmallInteger, nullable=False)
    # Краткий текстовый вывод анализа
    summary = Column(Text, nullable=False)
    # Время создания анализа
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # Рисунок, к которому относится этот анализ
    drawing = relationship("Drawing", back_populates="analysis")

    __table_args__ = (
        CheckConstraint("score >= 1 AND score <= 10", name="ck_analyses_score"),
    )


class ChatMessage(Base):
    """Сообщение в чате обсуждения конкретного рисунка (вопрос пользователя / ответ ИИ)."""
    __tablename__ = "chat_messages"

    # Первичный ключ сообщения
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    # Рисунок, в чате которого оставлено сообщение
    drawing_id = Column(BigInteger, ForeignKey("drawings.id", ondelete="CASCADE"), nullable=False, index=True)
    # Автор сообщения (users.id) — заполняется и для 'user', и для 'assistant' сообщений
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    # Кто написал: 'user' — человек, 'assistant' — ИИ (ограничено ck_chat_role)
    role = Column(String(20), nullable=False)
    # Текст сообщения
    content = Column(Text, nullable=False)
    # Время отправки; по нему сортируется история чата (crud.get_drawing_chat)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # Рисунок, к которому относится сообщение
    drawing = relationship("Drawing", back_populates="chat_messages")
    # Автор сообщения
    user = relationship("User", back_populates="chat_messages")

    __table_args__ = (
        CheckConstraint("role IN ('user', 'assistant')", name="ck_chat_role"),
    )


class MinioObject(Base):
    """
    Хранилище содержимого файлов.

    Название и структура повторяют адресацию MinIO (S3): файл однозначно
    определяется парой (bucket, object_key). Сейчас бинарное содержимое лежит
    прямо в БД (поле content, LargeBinary) — таблица работает как «локальная
    замена» объектного хранилища.
    """
    __tablename__ = "minio_object"

    # Имя бакета (аналог «папки» верхнего уровня в S3/MinIO)
    bucket = Column(String(50), primary_key=True)
    # Путь к файлу внутри бакета, уникален в рамках бакета;
    # вторая часть составного первичного ключа
    object_key = Column(String(255), primary_key=True)
    # Содержимое файла в байтах. NULL, если файл реально лежит в MinIO,
    # а в БД хранится только его адрес
    content = Column(LargeBinary, nullable=True)

    # Рисунок, ссылающийся на этот файл
    drawing = relationship("Drawing", back_populates="file", uselist=False)
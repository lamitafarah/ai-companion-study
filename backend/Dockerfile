FROM python:3.12

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

COPY requirements.txt .
RUN pip install -r requirements.txt

USER appuser

COPY . .

EXPOSE 8000

CMD uvicorn apis.apis:api --host=0.0.0.0 --port=8000 --forwarded-allow-ips='*' --proxy-headers
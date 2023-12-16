FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY api ./

RUN pip install -r requirements.txt

RUN apt-get -y update && \
    apt-get -y install curl

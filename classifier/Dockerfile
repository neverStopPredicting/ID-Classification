# Classifier/Dockerfile
FROM python:3.9

WORKDIR /usr/src/app

COPY classifier/ .

RUN pip install pipenv && pipenv install --system --deploy

EXPOSE 8001

CMD ["pipenv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]

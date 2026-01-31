# Use official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY ai_service/requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir torch torchvision mlflow

# Copy the current directory contents into the container at /app
COPY ai_service/ /app/ai_service/
COPY .env /app/

# Set environment variables
ENV PYTHONPATH="${PYTHONPATH}:/app/ai_service"
ENV PYTHONUNBUFFERED=1

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the application
CMD ["uvicorn", "ai_service.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

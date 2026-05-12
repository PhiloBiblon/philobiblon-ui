FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
RUN useradd --create-home --shell /usr/sbin/nologin appuser \
    && chown appuser:appuser /app/app.jar
USER appuser
ENTRYPOINT ["java", "-jar", "app.jar"]

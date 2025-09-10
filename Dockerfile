# ==== Build stage ====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline

# Copy the rest and build
COPY src ./src
RUN mvn -q -DskipTests package

# ==== Runtime stage ====
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the fat jar (adjust name if different)
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
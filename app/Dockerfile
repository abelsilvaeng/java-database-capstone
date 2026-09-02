# ---------------------------------------------------------------------
# Stage 1 - build the fat jar with Maven inside the image, so the build
# does not depend on what is installed on the host.
# ---------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /build

# Copy the POM first: as long as it does not change, the dependency layer
# stays cached and rebuilds only recompile the source.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------------------------------------------------------------------
# Stage 2 - run the jar on a JRE only. Nothing from the build stage
# other than the artifact makes it into the final image.
# ---------------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Run as a non-root user.
RUN addgroup -S smartclinic && adduser -S smartclinic -G smartclinic

COPY --from=build /build/target/*.jar app.jar
RUN chown smartclinic:smartclinic app.jar

USER smartclinic

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

DOCKER_COMPOSE_FILE=docker/docker-compose.dev.yml
DOCKER_BUILD_FLAGS=--progress=plain
PG_CONTAINER_NAME=starter-postgres
REDIS_CONTAINER_NAME=starter-redis
DEV_COMMAND=bun --bun dev
DB_NAME=starter

.PHONY: build up down restart logs redis-flush check dev db-check db-create

build:
	docker compose -f $(DOCKER_COMPOSE_FILE) build $(DOCKER_BUILD_FLAGS)

up:
	docker compose -f $(DOCKER_COMPOSE_FILE) up -d

down:
	docker compose -f $(DOCKER_COMPOSE_FILE) down

restart:
	docker compose -f $(DOCKER_COMPOSE_FILE) restart

logs:
	docker compose -f $(DOCKER_COMPOSE_FILE) logs -f

# Flush all Redis data in the running container
redis-flush:
	docker exec starter-redis redis-cli FLUSHALL

# Check containers: build if missing, start if stopped
check:
	@missing=0; start_list=""; \
	for name in "$(PG_CONTAINER_NAME)" "$(REDIS_CONTAINER_NAME)"; do \
		if ! docker ps -a --format '{{.Names}}' | grep -wq "$$name"; then \
			echo "[check] Missing container: $$name"; \
			missing=1; \
		else \
			running=$$(docker inspect -f '{{.State.Running}}' "$$name" 2>/dev/null || echo false); \
			if [ "$$running" != "true" ]; then \
				echo "[check] Stopped container detected: $$name"; \
				start_list="$$start_list $$name"; \
			fi; \
		fi; \
	done; \
	if [ "$$missing" -eq 1 ]; then \
		# echo "[check] Building images via docker compose..."; \
		# docker compose -f $(DOCKER_COMPOSE_FILE) build $(DOCKER_BUILD_FLAGS); \
		echo "[check] Creating/starting services via docker compose..."; \
		docker compose -f $(DOCKER_COMPOSE_FILE) up -d; \
	elif [ -n "$$start_list" ]; then \
		echo "[check] Starting stopped containers:$$start_list"; \
		docker start $$start_list; \
	else \
		echo "[check] All required containers are running."; \
	fi

dev: check db-check
	$(DEV_COMMAND)

db-check:
	@echo "Checking if database '$(DB_NAME)' exists..."
	@if ! docker exec -i $(PG_CONTAINER_NAME) psql -U postgres -lqt | cut -d \| -f 1 | grep -qw $(DB_NAME); then \
		echo "Database '$(DB_NAME)' not found. Creating..."; \
		docker exec -i $(PG_CONTAINER_NAME) psql -U postgres -c "CREATE DATABASE $(DB_NAME);" 2>/dev/null && \
		echo "✅ Database '$(DB_NAME)' created successfully." || \
		(echo "❌ Failed to create database."; exit 1); \
	else \
		echo "✅ Database '$(DB_NAME)' exists and is accessible."; \
	fi

db-create:
	@echo "Creating database '$(DB_NAME)'..."
	@docker exec -i $(PG_CONTAINER_NAME) psql -U postgres -c "CREATE DATABASE $(DB_NAME);" 2>/dev/null && \
		echo "✅ Database '$(DB_NAME)' created successfully." || \
		(echo "❌ Failed to create database. It might already exist."; exit 1)
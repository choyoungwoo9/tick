# 로컬 MySQL

프로젝트 루트에서 실행한다. Docker가 실행 중이어야 한다.

```bash
docker compose up -d --wait
```

## 데이터베이스

| 용도 | Service | Port | Database | Volume |
| --- | --- | ---: | --- | --- |
| 서비스/개발 | `mysql` | 3307 | `tick` | `tick_mysql_data` |
| 테스트 | `mysql-test` | 3308 | `tick_test` | `tick_mysql_test_data` |

애플리케이션 기본 설정은 서비스 DB를 사용한다. `test` 프로필은 테스트 DB를 사용한다.

## 서비스 DB 접속 정보

| 항목 | 값 |
| --- | --- |
| Host | `127.0.0.1` |
| Port | `3307` |
| Database | `tick` |
| User | `tick` |
| Password | `tick-local` |
| JDBC URL | `jdbc:mysql://127.0.0.1:3307/tick` |

비밀번호는 로컬 개발용 기본값이다. 최초 생성 전에 `MYSQL_PASSWORD`와
`MYSQL_ROOT_PASSWORD` 환경변수로 바꿀 수 있다. root 기본 비밀번호는 `tick-root-local`이다.
기존 데이터가 있는 볼륨에서는 환경변수만 바꿔도 DB 비밀번호가 변경되지는 않는다.

```bash
mysql -h 127.0.0.1 -P 3307 -u tick -p tick
```

## 데이터와 스키마

- 데이터는 `tick_mysql_data` 볼륨에 보관된다.
- 테스트 데이터는 별도의 `tick_mysql_test_data` 볼륨에 보관된다.
- 비어 있는 볼륨으로 처음 실행할 때 `backend/src/main/resources/schema.sql`이 자동 적용된다.
- 이후 SQL 파일을 수정해도 자동 재적용되지 않는다. 기존 볼륨에는 변경 SQL을 직접 적용해야 한다.

계좌 이름과 번호를 추가한 뒤 기존 DB를 한 번씩 마이그레이션한다.

```bash
docker compose exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot tick' < backend/src/main/resources/migrations/002_add_account_name_and_number.sql
docker compose exec -T mysql-test sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot tick_test' < backend/src/main/resources/migrations/002_add_account_name_and_number.sql
```

## 상태 확인과 종료

```bash
docker compose ps
docker compose logs mysql
docker compose down
```

`docker compose down`은 컨테이너를 종료·제거하며 데이터 볼륨은 유지한다.
다시 `docker compose up -d --wait`를 실행하면 저장된 데이터를 사용한다.

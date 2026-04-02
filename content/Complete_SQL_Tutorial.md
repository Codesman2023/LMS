---
title: SQL for Beginners
description: A complete and detailed SQL tutorial with theory, examples, and queries.
slug: Complete_SQL_Tutorial
date: "2023-12-31"
author: MY-LMS
image: /blog.webp
---

# SQL Complete Tutorial (Beginner to Advanced)

## 1. Introduction to SQL

SQL stands for Structured Query Language. It is used to communicate with databases. SQL is the standard language for relational database management systems.

SQL allows users to:
- Create databases and tables
- Insert, update, delete data
- Retrieve data using queries
- Control access to databases

---

## 2. What is a Database?

A database is an organized collection of data stored electronically. Databases allow efficient storage, retrieval, and manipulation of data.

Examples:
- Student records
- Employee information
- Banking transactions

---

## 3. Types of Databases

- Relational Database
- NoSQL Database
- Distributed Database
- Cloud Database
- Graph Database

---

## 4. What is SQL?

SQL is a standard language used to perform operations on relational databases such as MySQL, PostgreSQL, Oracle, SQL Server.

---

## 5. History of SQL

SQL was developed by IBM in the 1970s. It was originally called SEQUEL (Structured English Query Language).

---

## 6. SQL vs NoSQL

| SQL | NoSQL |
|----|------|
| Structured | Unstructured |
| Fixed schema | Dynamic schema |
| Relational | Non-relational |

---

## 7. DBMS vs RDBMS

DBMS stores data as files, while RDBMS stores data in tables with relations.

---

## 8. Popular Database Systems

- MySQL
- PostgreSQL
- Oracle
- SQL Server
- SQLite

---

## 9. SQL Data Types

### Numeric
- INT
- FLOAT
- DOUBLE

### String
- CHAR
- VARCHAR
- TEXT

### Date
- DATE
- TIME
- TIMESTAMP

---

## 10. Constraints in SQL

Constraints are rules applied to table columns.

- PRIMARY KEY
- FOREIGN KEY
- UNIQUE
- NOT NULL
- CHECK
- DEFAULT

Example:
```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE
);
```

---

## 11. SQL Commands Overview

- DDL (Data Definition Language)
- DML (Data Manipulation Language)
- DQL (Data Query Language)
- TCL (Transaction Control Language)
- DCL (Data Control Language)

---

## 12. DDL Commands

### CREATE
```sql
CREATE DATABASE company;
```

### DROP
```sql
DROP DATABASE company;
```

---

## 13. DML Commands

### INSERT
```sql
INSERT INTO employees VALUES (1, 'Amit', 50000);
```

### UPDATE
```sql
UPDATE employees SET salary = 60000 WHERE id = 1;
```

### DELETE
```sql
DELETE FROM employees WHERE id = 1;
```

---

## 14. DQL Commands

### SELECT
```sql
SELECT * FROM employees;
```

---

## 15. TCL Commands

- COMMIT
- ROLLBACK
- SAVEPOINT

---

## 16. DCL Commands

- GRANT
- REVOKE

---

## 17. Creating Databases

```sql
CREATE DATABASE school;
```

---

## 18. Dropping Databases

```sql
DROP DATABASE school;
```

---

## 19. Creating Tables

```sql
CREATE TABLE students (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  age INT,
  course VARCHAR(50)
);
```

---

## 20. Alter Table

```sql
ALTER TABLE students ADD email VARCHAR(100);
```

---

## 21. Drop Table

```sql
DROP TABLE students;
```

---

## 22. Truncate Table

```sql
TRUNCATE TABLE students;
```

---

## 23. Insert Data

```sql
INSERT INTO students VALUES (1, 'Rahul', 21, 'BCA');
```

---

## 24. Select Queries

```sql
SELECT name, age FROM students;
```

---

## 25. WHERE Clause

```sql
SELECT * FROM students WHERE age > 20;
```

---

## 26. Logical Operators

- AND
- OR
- NOT

---

## 27. Comparison Operators

- =
- >
- <
- >=
- <=

---

## 28. BETWEEN, IN, LIKE

```sql
SELECT * FROM students WHERE age BETWEEN 18 AND 25;
```

---

## 29. ORDER BY

```sql
SELECT * FROM students ORDER BY age DESC;
```

---

## 30. GROUP BY

```sql
SELECT course, COUNT(*) FROM students GROUP BY course;
```

---

## 31. HAVING Clause

```sql
SELECT course, COUNT(*) FROM students GROUP BY course HAVING COUNT(*) > 1;
```

---

## 32. Aggregate Functions

- COUNT()
- SUM()
- AVG()
- MAX()
- MIN()

---

## 33. Joins Introduction

Joins are used to combine rows from two or more tables.

---

## 34. INNER JOIN

```sql
SELECT * FROM orders
INNER JOIN customers ON orders.cid = customers.id;
```

---

## 35. LEFT JOIN

```sql
SELECT * FROM orders
LEFT JOIN customers ON orders.cid = customers.id;
```

---

## 36. RIGHT JOIN

```sql
SELECT * FROM orders
RIGHT JOIN customers ON orders.cid = customers.id;
```

---

## 37. FULL JOIN

```sql
SELECT * FROM orders
FULL JOIN customers ON orders.cid = customers.id;
```

---

## 38. Self Join

```sql
SELECT A.name, B.name FROM employees A, employees B;
```

---

## 39. Cross Join

```sql
SELECT * FROM table1 CROSS JOIN table2;
```

---

## 40. Subqueries

```sql
SELECT * FROM students WHERE age > (SELECT AVG(age) FROM students);
```

---

## 41. Correlated Subqueries

A subquery that depends on the outer query.

---

## 42. Views

```sql
CREATE VIEW student_view AS SELECT name, course FROM students;
```

---

## 43. Indexes

```sql
CREATE INDEX idx_name ON students(name);
```

---

## 44. Stored Procedures

```sql
CREATE PROCEDURE getStudents()
BEGIN
  SELECT * FROM students;
END;
```

---

## 45. Functions

```sql
CREATE FUNCTION getAge() RETURNS INT;
```

---

## 46. Triggers

```sql
CREATE TRIGGER before_insert BEFORE INSERT ON students;
```

---

## 47. Transactions

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100;
COMMIT;
```

---

## 48. ACID Properties

- Atomicity
- Consistency
- Isolation
- Durability

---

## 49. Normalization

Normalization reduces redundancy.

Normal Forms:
- 1NF
- 2NF
- 3NF
- BCNF

---

## 50. SQL Interview Questions

1. What is SQL?
2. Difference between WHERE and HAVING?
3. What is JOIN?
4. What is PRIMARY KEY?
5. Explain normalization.

---

## Conclusion

This tutorial covered SQL from basics to advanced concepts with theory and examples. This document is suitable for blogs, study notes, and interview preparation.

---

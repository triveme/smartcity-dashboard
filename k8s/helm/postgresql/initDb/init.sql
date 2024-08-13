-- be aware this init script is only executed once (on the first setup),
-- all changes done later, needs to be applied manually

-- keycloak db to separate tables from scs db
create user keycloak with password 'admin';
create database keycloak with owner keycloak;

-- test db to separate tables from scs db
create user testing with password 'admin';
create database testing with owner testing;

import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
export function openStore(filename, migrationDir){
 if(filename!==':memory:')mkdirSync(path.dirname(filename),{recursive:true});
 const db=new DatabaseSync(filename);db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
 db.exec('CREATE TABLE IF NOT EXISTS _pink_migrations (name TEXT PRIMARY KEY)');
 for(const file of readdirSync(migrationDir).filter(n=>n.endsWith('.sql')).sort()){
  if(db.prepare('SELECT name FROM _pink_migrations WHERE name = ?').get(file))continue;
  db.exec('BEGIN IMMEDIATE');try{db.exec(readFileSync(path.join(migrationDir,file),'utf8'));db.prepare('INSERT INTO _pink_migrations (name) VALUES (?)').run(file);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
 }
 return {
  close(){db.close()},
  prepare(sql){
   return {
    bind(...args){
     return {
      async first(){return db.prepare(sql).get(...args)||null},
      async run(){const r=db.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}}}
     };
    }
   };
  }
 };
}

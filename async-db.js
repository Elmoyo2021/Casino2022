const mysql = require('mysql')
const pool = mysql.createPool({
  host     : 'localhost',
  user     : 'Casino',
  password : 'nM5ATG5wzk5HaRwX',
  database : 'Casino'
})

let query = function( sql, values ) {
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        connection.query(sql, values, ( err, rows) => {

          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          connection.release()
        })
      }
    })
  })
}

module.exports = { query }
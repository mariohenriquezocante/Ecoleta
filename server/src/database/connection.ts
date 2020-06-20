import knex from 'knex'
import path from 'path'

const connection = knex({
    client: 'sqlite3', //Mostrando pro Knex qual client(banco) vai utilizar.
    connection: {
        filename: path.resolve(__dirname, 'database.sqlite')//Passando o caminho de onde vai ser criado o arquivo do banco, e o nome dele.
    },
    useNullAsDefault: true,
})

export default connection
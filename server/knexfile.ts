import path from 'path'


module.exports = {
    client: 'sqlite3', //Mostrando pro Knex qual client(banco) vai utilizar.
    connection: {
        filename: path.resolve(__dirname, 'src', 'database', 'database.sqlite')//Passando o caminho de onde vai ser criado o arquivo do banco, e o nome dele.
    },
    migrations: {
        directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
        directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    },
    useNullAsDefault: true,
}

import express from 'express'
import PointsController from './controllers/PointsController'
import ItemsController from './controllers/ItemsController'

const routes = express.Router()

//Criando uma instancia da classe.
const pointsController = new PointsController()

//Criando uma instancia da classe.
const itemsController = new ItemsController()

//Rota para listar todos os items cadastrados.
routes.get('/items', itemsController.index);

//Rota para cadastrar um novo ponto.
routes.post('/points', pointsController.create)

//Rota para listar varios points.
routes.get('/points', pointsController.index)

//Rota para listar um ponto especifico.
routes.get('/points/:id', pointsController.show)

export default routes
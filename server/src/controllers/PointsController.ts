import knex from '../database/connection'
import { Request, Response } from 'express'

class PointsController {
    //Metodo para listar varios points(filtrados).
    async index( request: Request, response: Response) {
        const { city, uf, items } = request.query
        
        //Transformando o items(array) em string e separando os elementos por virgula,depois tira os espaços e transforma em numero.
        const parsedItems = String(items).split(',').map(item => Number(item.trim()))

        const points = await knex('points')
          .join('point_items', 'points.id', '=', 'point_items.point_id')
          .whereIn('point_items.item_id', parsedItems)
          .where('city', String(city))
          .where('uf', String(uf))
          .distinct()
          .select('points.*')

        return response.json(points)
    }

    //Método para listar um único point.
    async show( request: Request, response: Response) {
        const { id } = request.params

        //Buscando no banco um point com o id igual ao que veio do frontend.
        const point = await knex('points').where('id', id).first()

        if (!point) {
            return response.status(400).json({ message: 'Point not found!' })
        }

        //Fazendo um join para buscar quais items estao relacionado a esse point especifico.
        const items = await knex('items')
          .join('point_items', 'items.id', '=', 'point_items.item_id')
          .where('point_items.point_id', id)
          .select('items.title')

        return response.json({ point, items})

    }

    //Método para criar um novo point.
    async create (request: Request, response: Response) {
        //Pegando os dados do frontend.
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body
    
        //Ligando as querys,para que se uma der erro a outra nao execulte.
        const trx = await knex.transaction()
    
        //Adicionando os dados na tabela para criar um novo point.
        const point = {
            image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }

        const insertedIds = await trx('points').insert(point)
    
        const point_id = insertedIds[0]
    
        //Relacionando a tabela points com a items.
        const pointItems = items.map((item_id: number) => {
            return {
                item_id,
                point_id
            }
        })
    
        await trx('point_items').insert(pointItems)

        await trx.commit()
    
        return response.json({
            id: point_id,
            ...point,
        })
  }
}

export default PointsController
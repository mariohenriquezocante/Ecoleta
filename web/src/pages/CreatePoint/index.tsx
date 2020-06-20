import React, { useEffect, useState, ChangeEvent, FormEvent} from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import api from '../../services/api'
import axios from 'axios'

import './styles.css'
import logo from '../../assets/logo.svg'

interface Item {
    id: number
    title: string
    image_url: string
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}

const CreatePoint = () => {
    //Criando um estado para trazer os items pre cadastrados do sistema.
    const [items, setItems] = useState<Item[]>([])
    //Criando um estado para trazer as UFs do IBGE.
    const [ ufs, setUfs ] = useState<string[]>([])
    //Criando um estado para armazenar as cidades.
    const [ cities, setCities ] = useState<string[]>([])
    //Criando um estado para armazenar os items selecionados.
    const [ selectedItems, setSelectedItems ] = useState<number[]>([])
    
    //Criando um estado para armazenar os valores dos inputs.
    const [ formData, setFormData ] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    //Criando um estado para armazenar as UFs selecionadas.
    const [ selectedUf, setSelectedUf] = useState('0')
    //Criando um estado para armazenar as cidades selecionadas.
    const [ selectedCity, setSelectedCity] = useState('0')
    //Criando um estado para armazenar as cidades selecionadas.
    const [ selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0])
    //Criando um estado para iniciar o mapa na localização atual do usuario.
    const [ initialPosition, setInitialPosition] = useState<[number, number]>([0,0])

    const history = useHistory()

    //Função para realizar uma chamada a API, trazer os items ja cadastrados.
    useEffect( () => {
        api.get('items').then(response => {
            setItems(response.data)
        })
    }, [])

    //Função para buscar os estados(UF) do site do IBGE
    useEffect( () => {
        //Pegando as informaçoes de UF do site do IBGE.
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
           //Pegando somente a sigla das informaçoes recebidas.
            const ufInitials = response.data.map(uf => uf.sigla)

            setUfs(ufInitials)
        })
    }, [])

    //Função para carregar as cidades de acordo com a UF selecionada.
    useEffect( () => {
        if (selectedUf === '0'){
            return;
        }

         //Pegando as cidades da UF selecionada.
         axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
              .then(response => {
                 //Pegando somente o nome das cidades recebidas.
                 const cityNames = response.data.map(city => city.nome)
 
                 setCities(cityNames)
    })}, [selectedUf])
    
    //Funçao para pegar a localização inicial do usuario.
    useEffect( () => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords

            setInitialPosition([latitude, longitude])
        })
    }, [])

    //Função para pegar o valor da UF que foi selecionada, para poder listar as cidades dessa UF.
    function handleSelectUf (event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value

        setSelectedUf(uf)
    }
    
    //Função para pegar o valor da cidade que foi selecionada.
    function handleSelectCity (event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value

        setSelectedCity(city)
    }

    //Funçao para permitir o usuario marcar um ponto no mapa.
    function handleMapClick (event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }
    
    //Funçao para armazenar os valores dos inputs.
    function handleInputChange (event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target

        setFormData({...formData, [name]: value})
    }

    //Funçao para armazenar os items selecionados.
    function handleSelectItem (id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id)

        if (alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id)

            setSelectedItems(filteredItems)
        } else{
            setSelectedItems([...selectedItems, id])
        }
       
    }
    
    //Funçao para realizar o cadastro do pontp, mandar paraa o banco.
    async function handleSubmit (event: FormEvent) {
        event.preventDefault()

        const { name, email, whatsapp } = formData
        const uf = selectedUf
        const city = selectedCity
        const [latitude, longitude] = selectedPosition
        const items = selectedItems

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }
        
        await api.post('points', data)

        alert('Ponto de coleta criado!')

        history.push('/')
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowLeft/>
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                         type="text"
                         name="name"
                         id="name"
                         onChange={handleInputChange}
                         />
                    </div>

                    <div className="field-group">
                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <input
                         type="email"
                         name="email"
                         id="email"
                         onChange={handleInputChange}
                         />
                    </div>

                    <div className="field">
                        <label htmlFor="whatsapp">Whatsapp</label>
                        <input
                         type="text"
                         name="whatsapp"
                         id="whatsapp"
                         onChange={handleInputChange}
                         />
                    </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione um endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                      <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      <Marker position={selectedPosition}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                        <li 
                          key={item.id} 
                          onClick={() => handleSelectItem(item.id)} 
                          className={selectedItems.includes(item.id) ? 'selected' : ''}
                        >
                          <img src={item.image_url} alt={item.title}/>
                          <span>{item.title}</span>
                        </li>
                        ))}
                    </ul>
                </fieldset>
                
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint;
'use strict'
/**
 * Class RestClient Esta clase es un adaptador generico para un cliente REST, solo se usa el metodo get que es el necesario para hacer la peticion
 * @class RestClient
 * @author Maykol Purica <puricamaykol@gmail.com>
 */
/**
Forma de uso
var headers = {  accept: 'application/json',
                             authorization: 'Bearer 0bd1b7385e90634bc9d9c92b84380722fa00f8f4' }
            var rest = new restClient("http://webserver2a-local:9201/", headers)
            var success = function (data, response) {
                            // parsed response body as js object
                            console.log(data, "parsed response body as js object")
                            // raw response
                            //console.log(response)
                        }
            var params = { idFleet: '',
                             idSubFleet: '',
                             idVehicle: '',
                             iniDate: '2015-10-16',
                             endDate: '2016-11-07' }
            rest.get('odometer', params, success) **/
class RestClient {
  /**
   * Constructor de la clase RestClient.
   * @method constructor
   * @param {String} url     La URL base de la peticion
   * @param {String} headers Las cabeceras a enviar en la respuesta hacia el navegador
   */
  constructor (url, headers) {
    var Client = require('node-rest-client').Client
    this.client = new Client()
    this.url = url
    this.endpoint = ''
    this.headers = headers
  }

  /**
   * Metodo que envia una peticion GET con los parametros pasados
   * @method get
   * @param {String} path Ruta hacia la ubicacion del archivo
   * @param  {String}   endpoint El endpoint que representa al reporte en si
   * @param  {Object}   params   Objeto que contiene los parametros que se le pasaran al reporte
   * @param  {Function} callback  Callback que maneja el exito de la respuesta contiene la data y las cabeceras
   * @param {Function} errorHandler Calback qque devuelve los error al realizar la peticion
   * @return void
   */
  get (path, endpoint, fileFormat, params, callback, errorHandler) {
    this.endpoint = endpoint
    var args = {
      headers: this.headers
    }
    var requestParams = []
    for (var property in params) {
      var value = params[property]
      requestParams.push(`${property}=${value}`)
    }
    var fullUrl = this.url + path + this.endpoint + '.' + fileFormat + '?' + requestParams.join('&')
    this.client.get(fullUrl, args, callback).on('error', errorHandler)
  }
}

module.exports = RestClient

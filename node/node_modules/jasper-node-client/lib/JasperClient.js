'use strict'
/**
 * Modulo que envuelve la clase JasperClient. Recibe por parametro un objeto obj = {baseUrl: '', userName: '', password: '', headers: {}}
 * @module JasperClient
 * @param  {Object} config Los parametros basicos para el consumo del servicio. obj = {baseUrl: '', userName: '', password: '', headers: {}}
 * @return {Object} Retorna el objeto instanciable de la clase JasperClient
 * @todo DUcktyping para validar que existan los atributos baseUrl, userName, password y headers y que sean del tipo adecuado.
 * @todo  Mejorar el manejo de errores
 * @author Maykol Purica <puricamaykol@gmail.com>
 */
module.exports = function (config) {
  const RestClient = require('./RestClient/RestClient.js')
  var globalConf = config
    /**
     * Esta clase es un cliente que permite consumir la API RESTful de Jasper Reports.
     *
     * @class JasperClient
     * @author Maykol Purica <puricamaykol@gmail.com>
     */
    /*
     *Modo de uso
     const Jasper = require("[PATH HACIA LE MODULO]/JasperClient/src/js/JasperClient.js")({baseUrl: '', userName: '', password: '', headers: { authorization: 'Basic amFzcGVyYWRtaW46amFzcGVyYWRtaW4=', accept: 'application/json'}};
     var jasper = new Jasper(null, 'jasperadmin', 'jasperadmin');
     var reportPath = 'reports/PatrullajeInteligente/Informes/';
     var reportName = 'BitacoraTelefono';
     var fileFormat = 'pdf';
     var params = {
     fec_ini: '2016-11-01%2000:00:00',
     fec_fin: '2016-11-14%2000:00:00',
     telefono: '0414',
     conditions: '',
     auxiliarconditions: '',
     query: '' };
     jasper.requestReport(reportPath, reportName, fileFormat, params, (err, response, headers) => {
     if(err != null){
     console.log(err);
     }else{
     res.writeHead(200, headers);
     res.end(response);
     }

     });
     */
  class JasperClient {
    /**
     * Constructor de la clase.
     * @method constructor
     * @return {void}
     */
    constructor () {
      this._baseUrl = globalConf.baseUrl
      this._username = globalConf.userName
      this._password = globalConf.password
      this._exportHeaders = {
        'pdf': 'application/pdf',
        'xls': 'application/ms-excel',
        'xml': 'application/xml',
        'csv': 'text/csv',
        'rtf': 'application/octet-stream',
        'html': 'text/html'
      }
      this._requestHeaders = globalConf.headers
      this._apiClient = new RestClient(this._baseUrl, this._requestHeaders)
    }

    /**
     * Metodo que genera el reporte
     * @method requestReport
     * @param  {String} reportPath La ruta hacia el reporte
     * @param  {String} reportName El nombre del reporte deseado
     * @param  {String} fileFormat El formato requerido (ej, HTML, PDF,...)
     * @param  {Object} params     Los parametros requeridos por el reporte
     * @param {function} callback Un callback que devuelve errores si existen, la data del reporte y los headers a enviar con el archivo
     * @return {void}        Se provee de un callback al que se le pasa la data de salida
     */
    requestReport (reportPath, reportName, fileFormat, params, callback) {
      var respuesta = ''
      var self = this
      var _callback = function (data, response) {
        respuesta = data
        var headers = self.getResponseHeaders(fileFormat, reportName, data.length)
        callback(null, data, headers, response)
      }
      var _errorHandler = function (err) {
        callback(err.request.options, null, null)
      }
      this._apiClient.get(reportPath, reportName, fileFormat, params, _callback, _errorHandler)
      return respuesta
    }

    /**
     * Metodo que construye las cabezeras a ser enviadas con el archivo
     * @method getResponseHeaders
     * @param  {String} fileFormat Formato del archivo: pdf, html, txt, etc
     * @param  {String} reportName Nombre del reporte a imprimir
     * @param  {Integer} dataLength Longitud del buffer
     * @return {Object}  Retorna un objecto que contiene las cabeceras
     */
    getResponseHeaders (fileFormat, reportName, dataLength) {
      var headers = {
        'Content-Disposition': 'attachment;filename=' + reportName + '.' + fileFormat.toLowerCase(),
        'Content-Type': this._exportHeaders[fileFormat.toLowerCase()],
        'Content-Length': dataLength
      }
      return headers
    }

  }

  return JasperClient
}

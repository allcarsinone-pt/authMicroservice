const { Client } = require('@elastic/elasticsearch');

class ElasticLogService {

  constructor (elasticURI) {
    this.elasticsearchClient = new Client({ 
      node: elasticURI,
      log: 'trace',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  async execute (service, message, levelType) {

    try {
      const result = await this.elasticsearchClient.index({
        index: 'logs',
        body: { service: service, message: message, timestamp: new Date(), level: levelType},
      });
    } catch (error) {
      console.error('Failed to index document:', error);
    }
  }
}

module.exports = ElasticLogService

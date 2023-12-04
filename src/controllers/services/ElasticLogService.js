const { Client } = require('@elastic/elasticsearch');

class ElasticLogService {

  constructor () {
    this.elasticsearchClient = new Client({ 
      node: 'http://localhost:9200',
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

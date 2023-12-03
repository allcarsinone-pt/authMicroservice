
class LogService {

  constructor () {
    this.elasticsearchClient = new Client({ 
      node: 'http://localhost:9200',
      log: 'trace',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  static async execute (service, message, levelType) {
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

module.exports = LogService

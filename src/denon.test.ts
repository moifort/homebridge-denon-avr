import axios from 'axios';
describe('denon test', () => {
  it('denon test', async () => {
    const http = axios.create({ baseURL: 'http://192.168.0.137' });
    await http.get('/goform/formiPhoneAppDirect.xml?SISAT/CBL');
    // await http.get('/goform/formiPhoneAppDirect.xml?PWON');
    // await http.get('/goform/formiPhoneAppDirect.xml?PWSTANDBY');
  });
});



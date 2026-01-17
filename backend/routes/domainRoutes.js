const express = require('express');
const router = express.Router();
const domain = require('../controllers/DomainController');
const auth = require('../middleware/authtokenMiddleware')

router.post('/', auth,domain.createDomain);
router.post('/:id/subdomain',auth, domain.createSubdomain);
router.get('/', auth,domain.getAllDomains);
// router.post('/:id/subdomain', domain.createSubdomainForDomain);
router.get('/cloudflare/:accountId',auth, domain.getDomainsFromCloudflare);
router.get('/:accountId/:domainName/records', auth,domain.getsubdomians);
router.delete('/:accountId/:domainName/records/:recordId',auth, domain.deleteRecord);
router.put('/:accountId/:domainName/records/:recordId',auth, domain.editRecord);
router.get('/search',auth, domain.searchDnsAcrossAccounts);

module.exports = router;

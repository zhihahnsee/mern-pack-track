const router = require('express').Router();
const axios = require('axios');
const { urlencoded } = require('express');
let Package = require('../models/package.model');

router.route('/').get((req, res) => {
    Package.find()
        .then(packages => res.json(packages))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/track/:trackingNumber').get(async (req, res) => {
    try {
        const OAuth = await axios.post(
            'https://apis-sandbox.fedex.com/oauth/token',
            {
                'grant_type': 'client_credentials',
                'client_id': 'l74af01797cdba43cfbaddbafd26874463',
                'client_secret': '05dc21b446944ec080ad7806f87d09af',
            },
            {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                }
            }
        );

        const response = await axios.post(
            'https://apis-sandbox.fedex.com/track/v1/trackingnumbers',
            {
                includeDetailsScans: true,
                trackingInfo: [{ trackingNumber: req.params.trackingNumber }],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + OAuth.data.access_token,
                    'X-locale': 'en_US'
                },
            }
        );

        const trackingData = response?.data?.TrackingPackagesResponse?.packageList?.[0]
        if (!trackingData) {
            throw new Error('Unable to retrieve tracking information');
        }
        res.json(trackingData);
    } catch (error) {
        console.error(error);
        res.status(500).json('Error: Unable to retrieve tracking information' + error);
    }
});

router.route('/add').post((req, res) => {
    const username = req.body.username;
    const status = req.body.status;
    const packagetype = req.body.packagetype;
    const deliverydate = Date.parse(req.body.deliverydate);
    
    const newPackage = new Package({
        username,
        status,
        packagetype,
        deliverydate,
    });

    newPackage.save()
        .then(() => res.json('Package added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
    Package.findById(req.params.id)
        .then((package) => res.json(package))
        .catch(err => res.status(400).json('Error:' + err));
});

router.route('/:id').delete((req, res) => {
    Package.findByIdAndDelete(req.params.id)
        .then(() => res.json('Package deleted!'))
        .catch(err => res.status(400).json('Error:' + err)); 
});

router.route('/update/:id').post((req, res) => {
    Package.findById(req.params.id)
        .then(package => {
            package.username = req.body.username;
            package.packagetype = req.body.packagetype;
            package.status = req.body.status;
            package.deliverydate = Date.parse(req.body.deliverydate);

            package.save()
                .then(() => res.json('Package updated!'))
                .catch(err => res.status(400).json('Error:' + err));
        })
        .catch(err => res.status(400).json('Error:' + err));
});

module.exports = router;
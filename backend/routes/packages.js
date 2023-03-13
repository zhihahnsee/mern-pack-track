const router = require('express').Router();
const axios = require('axios');
const { urlencoded } = require('express');
let Package = require('../models/package.model');
require('dotenv').config({ path: '../.env' });

// if route is .../packages/, then returns all packages from DB in json format
router.route('/').get((req, res) => {
    Package.find()
        .then(packages => res.json(packages))
        .catch(err => res.status(400).json('Error: ' + err));
});

// if route is .../packages/track/trackingNumber,
router.route('/track/:trackingNumber').get(async (req, res) => {
    try {
        // attempt to get OAuth token from FedEx Auth API
        const OAuth = await axios.post(
            'https://apis-sandbox.fedex.com/oauth/token',
            {
                'grant_type': 'client_credentials',
                'client_id': process.env.CLIENT_ID,
                'client_secret': process.env.CLIENT_SECRET,
            },
            {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                }
            }
        );

        // attempt to get a response from tracking API
        const response = await axios.post(
            'https://apis-sandbox.fedex.com/track/v1/trackingnumbers',
            {
                'includeDetailedScans': true,
                'trackingInfo': [
                    {
                        'trackingNumberInfo': {
                            'trackingNumber': req.params.trackingNumber
                        }
                    }
                ],
            },
            {
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + OAuth.data.access_token,
                    'x-locale': 'en_US'
                },
            }
        );
        // trackingData is the response that is received after API is called
        const trackingData = response.data;
        if (!trackingData) {
            throw new Error('Unable to retrieve tracking information');
        }
        res.json(trackingData);
    } catch (error) {
        console.error(error.res.errors);
        res.status(500).json('Error: Unable to retrieve tracking information' + error);
    }
});

// if route is .../packages/add, then (in json) add all schema vars and
// create a new package with the variables
// then save the package
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

// if route is .../packages/:id and GET request where :id is the id from DB
// then find the package by id through the database
// and print it out 
router.route('/:id').get((req, res) => {
    Package.findById(req.params.id)
        .then((package) => res.json(package))
        .catch(err => res.status(400).json('Error:' + err));
});

// if route is .../packages/:id and DELETE request where :id is the id from the DB
// then find the package by ID and delete it
router.route('/:id').delete((req, res) => {
    Package.findByIdAndDelete(req.params.id)
        .then(() => res.json('Package deleted!'))
        .catch(err => res.status(400).json('Error:' + err)); 
});

// if route is .../packages/update/:id, find the package
// give updated schema vars
// and save the package to DB
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
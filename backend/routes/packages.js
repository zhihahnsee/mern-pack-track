const router = require('express').Router();
let Package = require('../models/package.model');

router.route('/').get((req, res) => {
    Package.find()
        .then(packages => res.json(packages))
        .catch(err => res.status(400).json('Error: ' + err));
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
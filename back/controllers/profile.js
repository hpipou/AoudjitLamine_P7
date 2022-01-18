const db = require('../models');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Enregistrement la photo de profile dans la table Users
exports.postPhoto = async (req, res, next) => {
    // retrouver le user
    const user = await db.sequelize.models.User.findOne({
        where: {
            id: req.auth.userId,
        }
    })
    const profileUrl = req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null;

    // Suppression de l'ancien media
    if (user.profileUrl) {
        const filename = user.profileUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            updateUser(user, profileUrl, res);
        })
    } else {
        updateUser(user, profileUrl, res);
    }
}

// Mise a jour d'un user
function updateUser(user, profileUrl, res) {
    user.update({profileUrl})
        .then(() => res.status(201).json({message: 'Photo de profile est à jour !', profileUrl}))
        .catch(function (err) {
            res.status(500).json({message: 'Error server'});
            console.log(err);
        });
}

// Mettre à jour le pseudo
exports.updatePseudo = async (req, res, next) => {
    // Retrouver le user
    const user = await db.sequelize.models.User.findOne({
        where: {
            id: req.auth.userId,
        }
    })
    // Retrouver le pseudo dans la table Users
    const pseudo = req.body.pseudo;
    const pseudoExists = await db.sequelize.models.User.findOne({
        where: {
            pseudo: pseudo,
        }
    });
    // Vérifier si le pseudo est déjà dans la table
    if (pseudoExists) {
        res.status(400).json({message: "Ce pseudo est déjà pris !"});

    }  // Sinon, mettre à jour le nouveau pseudo
    else {
        user.update({pseudo})
            .then(() => res.status(201).json({message: 'Votre pseudo est à jour !'}))
            .catch(function (err) {
                res.status(500).json({message: 'Error server'});
                console.log(err);
            });
    }
}

// Mettre à jour le mot de passe
exports.updatePassword = async (req, res) => {
    // Retrouver le user
    const user = await db.sequelize.models.User.findOne({
        where: {
            id: req.auth.userId,
        }
    })

    const oldPassword = req.body.password;
    const password = await bcrypt.hash(req.body.newPassword, 10);

    // Comparaison entre les deux mots de passe
    bcrypt.compare(oldPassword, user.password)
        // Si ce n'est pas valide, on envoie un message d'erreur
        .then(valid => {
            if (!valid) {
                return res.status(400).json({message: 'Mot de passe incorrect !'});
                // Sinon, on mets à jour le nouveau mot de passe
            } else {
                user.update({password})
                    .then(() => res.status(201).json({message: 'Votre mot de passe est à jour !'}))
                    .catch(function (err) {
                        res.status(500).json({message: 'Error server'});
                        console.log(err);
                    });
            }
        }).catch(error => res.status(500).json({error}));
}
// Suppression du compte
exports.deleteCompte = (req, res) => {

    // La suppression des posts, likes et commentaires se ferra en cascade
    // La suppression du media associé serra supprimé par un hook
    db.sequelize.models.User.findOne({
        where: {
            id: req.auth.userId
        }
    }).then((user) => {
        user.destroy()
            .then(() => res.status(200).json({message: 'le compte est supprimé !'}))
            .catch(error => res.status(500).json({error}));
    })
        .catch(error => res.status(500).json({error}));
}




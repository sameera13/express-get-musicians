const Band = require('./Band')
const Musician = require('./Musician')

Band.hasMany(Musician);
Musician.belongsTo(Band);

module.exports = {
    Band,
    Musician
};

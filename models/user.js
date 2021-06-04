'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Course);
    }
  }
  const props = {
    firstName: 'First name',
    lastName: 'Last name',
    emailAddress: 'Email address',
    password: 'Password',
  };

  for (let prop in props) {
    const msg = `${props[prop]} must have a value`;
    props[prop] = {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notNull: { msg }, notEmpty: { msg } },
    };
  }
  props.emailAddress.validate.isEmail = { msg: 'Please include a valid email address' };
  props.emailAddress.unique = true;

  props.password = {
    set(val) {
      if (!val) return '';
      const hashedPassword = bcrypt.hashSync(val, 10);
      this.setDataValue('password', hashedPassword);
    },
    ...props.password,
  };

  User.init(props, {
    sequelize,
  });
  return User;
};

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User);
    }
  }

  function makeRequireOptions(...fields) {
    return fields.reduce((option, prop) => {
      const msg = `${prop[0].toUpperCase() + prop.slice(1)} must have a value`;
      option[prop] = { allowNull: false, validate: { notNull: { msg }, notEmpty: { msg } } };
      return option;
    }, {});
  }

  const requiredOptions = makeRequireOptions('title', 'description');

  Course.init(
    {
      title: { type: DataTypes.STRING, ...requiredOptions.title },
      description: { type: DataTypes.TEXT, ...requiredOptions.description },
      estimatedTime: DataTypes.STRING,
      materialsNeeded: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Course',
    },
  );
  return Course;
};

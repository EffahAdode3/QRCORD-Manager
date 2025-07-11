
import { DataTypes } from 'sequelize';
import sequelize from '../db/config.js';

const User = sequelize.define('members', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  f_name: {
    type: DataTypes.STRING,
    allowNull: false,
  
  },
  m_name: {
    type: DataTypes.STRING,
    allowNull: false,
  
  },
  l_name: {
    type: DataTypes.STRING,
    allowNull: false,
  
  },
  email: {
    type: DataTypes.STRING, 
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, 
    },
  },
  identificationNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  numberField: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  
});

export default User;

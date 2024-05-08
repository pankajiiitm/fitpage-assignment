// app/models/locationModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Location = sequelize.define('Location', {
    location_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
},
{
    tableName: 'Location',
    // timestamps: false, // explicitly set the table name
    // If don't want createdAt
    createdAt: false,

    // If don't want updatedAt
    updatedAt: false, // explicitly set the table name
});

// // Assuming Location is your Sequelize model
// sequelize.sync({ force: true }) // This will create all tables defined by your models
//   .then(() => {
//     console.log('Tables synced successfully');
//   })
//   .catch(err => {
//     console.error('Error syncing tables:', err);
//   });


// Sync the models with the database
async function syncModels() {
    try {
      // Check if the Location table exists
      const tableExists = await sequelize.getQueryInterface().showAllTables();
      if (!tableExists.includes('Location')) {
        // If the table doesn't exist, create it
        await Location.sync();
        console.log('Location table created successfully');
      } else {
        console.log('Location table already exists');
      }
    } catch (error) {
      console.error('Error syncing models:', error);
    }
  }
  
  // Call the syncModels function to sync the models with the database
  syncModels();
  
export default Location;

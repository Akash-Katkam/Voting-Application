"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Voters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Voters.hasMany(models.Vote, {
        foreignKey: "VId",
        onDelete: "CASCADE",
      });

      Voters.belongsTo(models.Elections, {
        foreignKey: "EId",
        onDelete: "CASCADE",
      });
    }

    static async getAllVotersofElection({ EId, UId }) {
      return await this.findAll({
        where: {
          EId: EId,
        },
        include: [
          {
            model: sequelize.models.Elections,
            where: {
              UId: UId,
              id: EId,
            },
          },
        ],
      });
    }

    static async getElectionOfVoter({ VId, EId }) {
      return await this.findOne({
        where: {
          id: VId,
        },
        include: [
          {
            model: sequelize.models.Elections,
            where: {
              id: EId,
            },
          },
        ],
      });
    }

    static async createVoter({
      voterid,
      password,
      votername,
      firstname,
      lastname,
      EId,
    }) {
      const voter = await Voters.create({
        voterid: voterid,
        password: password,
        votername: votername,
        firstname: firstname,
        lastname: lastname,
        EId: EId,
      });
      // console.log(voter)
      return voter;
    }

    static async remove(VId, EId) {
      return this.destroy({
        where: {
          id: VId,
          EId: EId,
        },
      });
    }
  }
  Voters.init(
    {
      voterid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: "Voter ID cannot be null",
          },
          notEmpty: {
            msg: "Voter ID cannot be empty",
          },
          islen: function (value) {
            if (value.length < 3) {
              throw new Error("Voter ID must be atleast 3 characters long");
            }
          },
          isUnique: async function (value) {
            if (value == null) {
              throw new Error("Voter ID must be atleast 3 characters long");
            }
            const voter = await Voters.findOne({
              where: {
                voterid: value,
              },
            });
            if (voter) {
              throw new Error("Voter ID already exists");
            }
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Password cannot be null",
          },
          notEmpty: {
            msg: "Password cannot be empty",
          },
        },
      },
      votername: DataTypes.STRING,
      firstname: DataTypes.STRING,
      lastname: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Voters",
    }
  );
  return Voters;
};

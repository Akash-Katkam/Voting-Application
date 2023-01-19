"use strict";
const { Model } = require("sequelize");
// eslint-disable-next-line no-unused-vars
module.exports = (sequelize, DataTypes) => {
  class Vote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Vote.belongsTo(models.Voters, {
        foreignKey: {
          name: "VId",
          allowNull: false,
        },
        onDelete: "CASCADE",
      });

      Vote.belongsTo(models.Question, {
        foreignKey: "QId",
        onDelete: "CASCADE",
      });

      Vote.belongsTo(models.Option, {
        foreignKey: "OId",
        onDelete: "CASCADE",
      });
    }

    static async createVote({ VID, QID, OID }) {
      if (VID && QID && OID) {
        const vote = await Vote.create({
          VId: VID,
          QId: QID,
          OId: OID,
        });
        return vote;
      } else {
        return null;
      }
    }

    static async getVotesOfOption({ OID }) {
      if (OID) {
        const votes = await Vote.findAll({
          where: {
            OId: OID,
          },
        });
        return votes;
      } else {
        return null;
      }
    }

    static async hasVoted({ VID, QID }) {
      if (VID && QID) {
        const vote = await Vote.findOne({
          where: {
            VId: VID,
            QId: QID,
          },
        });
        if (vote) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  Vote.init(
    {},
    {
      sequelize,
      modelName: "Vote",
    }
  );
  return Vote;
};

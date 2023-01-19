"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Elections extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Elections.belongsTo(models.ElectionAdmin, {
        foreignKey: "UId",
      });

      Elections.hasMany(models.Question, {
        foreignKey: "EId",
        onDelete: "CASCADE",
      });

      Elections.hasMany(models.Voters, {
        foreignKey: "EId",
        onDelete: "CASCADE",
      });
    }

    static async createElection({ electionName, customString, UId }) {
      const election = await Elections.create({
        electionName: electionName,
        customString: customString,
        UId: UId,
      });
      return election;
    }

    static async getElectionsofUser({ UId }) {
      return await this.findAll({
        where: {
          UId: UId,
          isLive: false,
        },
      });
    }
    static async isElectionLive({ EID }) {
      let election = await this.findOne({
        where: {
          id: EID,
        },
      });
      // console.log("Election is Live: ",election.isLive)
      if (election && election.isLive) {
        return {
          success: election.isLive,
          ended: election.ended,
          message: "Success",
        };
      } else if (election && !election.isLive) {
        return {
          success: election.isLive,
          ended: election.ended,
          message: "Election assigned to you is Not Live Yet!!!",
        };
      } else {
        return {
          success: false,
          message: "Election Does Not Exist",
        };
      }
    }

    static async electionEnded({ EID }) {
      if (EID == null || EID == undefined || EID == "") {
        return {
          success: false,
          message: "Election Not Found",
        };
      } else {
        const election = await this.findOne({
          where: {
            id: EID,
          },
        });
        if (election) {
          if (election.ended) {
            return {
              success: true,
              message: "Election Ended",
            };
          } else {
            return {
              success: false,
              message: "Election Not Ended",
            };
          }
        } else {
          return {
            success: false,
            message: "Election Not Found",
          };
        }
      }
    }

    static async getLiveElectionsofUser({ UId }) {
      return await this.findAll({
        where: {
          UId: UId,
          isLive: true,
        },
      });
    }

    static async launchElection({ EId, UId }) {
      let election = await this.findOne({
        where: {
          id: EId,
          UId: UId,
        },
      });
      if (election) {
        await election.update({ isLive: true });
      }
    }

    static async endElection({ EId, UId }) {
      let election = await this.findOne({
        where: {
          id: EId,
          UId: UId,
        },
      });
      if (election) {
        await election.update({ isLive: false, ended: true });
      }
    }

    static async isElectionbelongstoUser({ EId, UId }) {
      let election = await this.findOne({
        where: {
          id: EId,
        },
        include: [
          {
            model: sequelize.models.ElectionAdmin,
            where: {
              id: UId,
            },
          },
        ],
      });
      if (election) {
        return {
          success: true,
          isLive: election.isLive,
          ended: election.ended,
        };
      } else {
        return {
          success: false,
          message: "Election does not belong to user",
        };
      }
    }

    static async getElection({ EId }) {
      return await this.findOne({
        where: {
          id: EId,
        },
      });
    }

    static async deleteElection({ EId }) {
      return await this.destroy({
        where: {
          id: EId,
        },
      });
    }
  }
  Elections.init(
    {
      electionName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Election name cannot be empty",
          },
          notEmpty: {
            msg: "Election name cannot be empty",
          },
          islen: function (val) {
            if (val.length < 5) {
              throw new Error(
                "Election name must be atleast 5 characters long"
              );
            }
          },
        },
      },
      // Can be used to generate a custom URL for the election and should be unique for each election
      customString: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
        validate: {
          islen: function (val) {
            if (val != null && val.length > 0 && val.length < 5) {
              throw new Error(
                "Custom string must be atleast 5 characters long"
              );
            }
          },
          isUnique: async function (val) {
            if (val != null && val.length > 0) {
              let election = await Elections.findOne({
                where: {
                  customString: val,
                },
              });
              if (election) {
                throw new Error(
                  "Election with this custom string already exists"
                );
              }
            }
          },
        },
      },
      isLive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      ended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Elections",
    }
  );
  return Elections;
};

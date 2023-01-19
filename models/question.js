"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Question.hasMany(models.Vote, {
        foreignKey: "QId",
        onDelete: "CASCADE",
      });

      Question.hasMany(models.Option, {
        foreignKey: "QId",
        onDelete: "CASCADE",
      });

      Question.belongsTo(models.Elections, {
        foreignKey: "EId",
        onDelete: "CASCADE",
      });
    }

    // Get all questions of an election with options from Option model
    static async getAllQuestionsofElection({ EId, UId }) {
      const questions = await Question.findAll({
        where: {
          EId,
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
      return questions;
    }

    static async getQuesionsOfElection({ EId }) {
      const questions = await Question.findAll({
        where: {
          EId: EId,
        },
      });
      return questions;
    }

    static async deleteQuestion({ QId, EID }) {
      return await Question.destroy({
        where: {
          id: QId,
          EId: EID,
        },
      });
    }

    static async createQuestion({ title, desc, EId }) {
      const question = await Question.create({
        title: title,
        desc: desc,
        EId: EId,
      });
      return question;
    }
  }
  Question.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Title cannot be null",
          },
          notEmpty: {
            msg: "Title cannot be empty",
          },
          islen: function (value) {
            if (value.length < 3 || value.length > 100) {
              throw new Error("Title must be between 3 and 100 characters");
            }
          },
        },
      },
      desc: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Description cannot be null",
          },
          notEmpty: {
            msg: "Description cannot be empty",
          },
          islen: function (value) {
            if (value.length < 3 || value.length > 500) {
              throw new Error(
                "Description must be between 3 and 500 characters"
              );
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Question",
    }
  );
  return Question;
};

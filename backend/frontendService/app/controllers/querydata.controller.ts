import { QueryData, QueryDataModel } from "../models/querydata.model";
import { DeleteResult } from "mongodb";

class QueryDataController {
  public async updateOneById(
    updateId: string,
    updateContent: QueryData
  ): Promise<void> {
    try {
      console.log("updateOneById");
      console.log(updateContent);
      const res = await QueryDataModel.updateOne(
        { _id: updateId },
        updateContent
      );
      if (res.matchedCount === 0) {
        throw new Error("No QueryData found!");
      }
      console.log("QueryData successfully updated!");
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  public async deleteMany(idsToDelete: string[]): Promise<DeleteResult> {
    try {
      const result = await QueryDataModel.deleteMany({
        _id: { $in: idsToDelete },
      });
      console.log("QueryData successfully deleted!");
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  public async insertMany(
    qdToInsert: string | QueryData[]
  ): Promise<QueryData[]> {
    try {
      const data = await QueryDataModel.insertMany(qdToInsert);
      console.log("QueryData successfully added!");
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  public async findAllIds(): Promise<string[]> {
    try {
      const qdIds: string[] = await QueryDataModel.find({}, "name_id");
      if (qdIds.length === 0) {
        throw new Error("No QueryData found!");
      }
      return qdIds;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  public async findById(id: string): Promise<QueryData> {
    try {
      const result: QueryData | null = await QueryDataModel.findById(id);
      if (!result) {
        throw new Error("No QueryData found!");
      }
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  public async findAll(): Promise<QueryData[]> {
    return new Promise((resolve, reject) => {
      QueryDataModel.find(
        {},
        (err: Error | null, queryData: QueryData[] | null) => {
          if (err) {
            reject(err);
            return;
          }
          if (!queryData) {
            reject("No QueryData found in collection!");
            return;
          }
          resolve(queryData);
        }
      );
    });
  }
}


export default new QueryDataController();

import {Schema, model} from 'mongoose';

export interface Food{
    id:string;
    name:string;
    price:number;
    tags: string[];
    favorite:boolean;
    imageUrl: string;
}

export const FoodSchema = new Schema<Food>(
    {
        id: {type: String, required:true},
        name: {type: String, required:true},
        price: {type: Number, required:true},
        tags: {type: [String]},
        favorite: {type: Boolean, default:false},
        imageUrl: {type: String, required:true},
    },{
        toJSON:{
            virtuals: true
        },
        toObject:{
            virtuals: true
        },
        timestamps:true
    }
);

export const FoodModel = model<Food>('food', FoodSchema);
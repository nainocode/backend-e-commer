import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [100, 'Product name cannot exceed 100 characters']
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            maxlength: [1000, 'Product description cannot exceed 1000 characters']
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: [0, 'Price must be greater than or equal to 0']
        },
        category: {
            type: String,
            required: [true, 'Product category is required'],
            trim: true
        },
        stock: {
            type: Number,
            required: [true, 'Product stock is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0
        },
        image: {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        reviews: {
            type: Number,
            default: 0
        },
        discount : {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model('Product', productSchema);

export default Product;

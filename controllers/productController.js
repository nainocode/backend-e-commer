import Product from '../models/Product.js';
import { v2 as cloudinary } from 'cloudinary';

// Get all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get product by ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Create product
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, rating, reviews , discount } = req.body;

        if (!name || !description || !price || !category || !stock) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields'
            });
        }

        const { image } = req.files;
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please upload an image file'
            });
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(image.mimetype)) {
            return res.status(400).json({
                success: false,
                error: 'Only JPEG and PNG image types are allowed'
            });
        }

        const uploadResult = await cloudinary.uploader.upload(image.tempFilePath)
        if (!uploadResult || uploadResult.error) {
            return res.status(500).json({
                success: false,
                error: 'Image upload failed'
            });
        }



        const product = await Product.create({
            name,
            description,
            price,
            category,
            stock,
            image:{
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url
            },
            rating,
            reviews,
            discount
        });



        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

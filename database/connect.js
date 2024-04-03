const { connect, pluralize } = require("mongoose");

pluralize(null);

module.exports = async () => {
    try {
        const connection = await connect(process.env.MONGODB_URI);
        console.log(`Connected to MongoDB at ${connection.connection.host}`);
        return connection;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

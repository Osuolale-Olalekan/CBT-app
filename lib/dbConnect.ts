import "server-only";
import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var mongoose: any;
}

const URI = process.env.MONGODB_URI;

if (!URI) {
  throw new Error("Can't find mongodb URI");
}

let cache = global.mongoose;

if (!cache) {
  cache = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const dbConnect = async () => {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const opts = { 
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // Increase timeout
      socketTimeoutMS: 45000,
    };
    cache.promise = mongoose.connect(URI, opts).then((mongoose) => mongoose);
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
};

export default dbConnect;






// import "server-only";
// import mongoose from "mongoose";

// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   var mongoose: any;
// }

// const URI = process.env.MONGODB_URI;

// if (!URI) {
//   throw new Error("Can't find mongodb URI");
// }

// let cache = global.mongoose;

// if (!cache) {
//   cache = global.mongoose = {
//     conn: null,
//     promise: null,
//   };
// }

// const dbConnect = async () => {
//   if (cache.conn) {
//     return cache.conn;
//   }

//   if (!cache.promise) {
//     const opts = { bufferCommands: false }; // 🔧 changed from true → false
//     cache.promise = mongoose.connect(URI, opts).then((mongoose) => mongoose);
//   }

//   try {
//     cache.conn = await cache.promise;
//   } catch (error) {
//     cache.promise = null;
//     throw error;
//   }

//   return cache.conn;
// };

// export default dbConnect;








//Just changed to the one above it up!
// import "server-only";

// import mongoose from "mongoose";

// declare global {
// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	var mongoose: any
// }

// const URI = process.env.MONGODB_URI;

// if (!URI) {
// 	throw new Error("Can't find mongodb URI");
// }

// let cache = global.mongoose;

// if (!cache) {
// 	cache = global.mongoose = {
// 		conn: null,
// 		promise: null
// 	}
// }

// const dbConnect = async () => {
// 	if (cache.conn) {
// 		return cache.conn;
// 	}

// 	if (!cache.promise) {
// 		const opts = { bufferCommands: true }
// 		cache.promise = mongoose.connect(URI, opts).then(mongoose => mongoose)
// 	}

// 	try {
// 		cache.conn = await cache.promise;
// 	} catch (error) {
// 		cache.promise = null;
// 		throw error;
// 	}

// 	return cache.conn
// }

// export default dbConnect;




















// lib/db.ts
// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI!;

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
// }

// let cached = (global as any).mongoose;

// if (!cached) {
//   cached = (global as any).mongoose = { conn: null, promise: null };
// }

// async function connectToDatabase() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//     };

//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
//       return mongoose;
//     });
//   }

//   try {
//     cached.conn = await cached.promise;
//   } catch (e) {
//     cached.promise = null;
//     throw e;
//   }

//   return cached.conn;
// }

// export default connectToDatabase;



DROP DATABASE IF EXISTS `shop`;

CREATE DATABASE `shop` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;

USE `shop`;

-- shop.`user` definition

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(256) NOT NULL,
  `password` varchar(256) NOT NULL,
  `type` enum('admin','customer') NOT NULL DEFAULT 'customer',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_UN` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- shop.forgot_password_token definition

CREATE TABLE `forgot_password_token` (
  `email` varchar(256) NOT NULL,
  `token` varchar(256) NOT NULL,
  `expires` datetime NOT NULL,
  UNIQUE KEY `forgot_password_token_email_UN` (`email`),
  UNIQUE KEY `forgot_password_token_token_UN` (`token`),
  KEY `forgot_password_FK` (`email`),
  CONSTRAINT `forgot_password_FK` FOREIGN KEY (`email`) REFERENCES `user` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- shop.`order` definition

CREATE TABLE `order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderDate` datetime NOT NULL DEFAULT current_timestamp(),
  `userId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_user_FK` (`userId`),
  CONSTRAINT `order_user_FK` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- shop.product definition

CREATE TABLE `product` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` double NOT NULL,
  `description` text NOT NULL,
  `imageUrl` varchar(512) NOT NULL,
  `userId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_FK` (`userId`),
  CONSTRAINT `product_FK` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- shop.cart definition

CREATE TABLE `cart` (
  `productId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  KEY `cart_product_FK` (`productId`),
  KEY `cart_user_FK` (`userId`),
  CONSTRAINT `cart_product_FK` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_user_FK` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- shop.order_item definition

CREATE TABLE `order_item` (
  `productId` int(11) DEFAULT NULL,
  `price` double NOT NULL,
  `quantity` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  KEY `order_item_order_FK` (`orderId`),
  KEY `order_item_product_FK` (`productId`),
  CONSTRAINT `order_item_order_FK` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`),
  CONSTRAINT `order_item_product_FK` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
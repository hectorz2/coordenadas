-- phpMyAdmin SQL Dump
-- version 4.7.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-10-2017 a las 16:21:45
-- Versión del servidor: 10.1.25-MariaDB
-- Versión de PHP: 7.1.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `coordenadas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `coordinates`
--

CREATE TABLE `coordinates` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8_spanish_ci NOT NULL,
  `x` int(11) NOT NULL,
  `z` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `coordinates`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `groups`
--

CREATE TABLE `groups` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8_spanish_ci NOT NULL,
  `world` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `groups`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nick` varchar(255) COLLATE utf8_spanish_ci NOT NULL,
  `password` varchar(255) COLLATE utf8_spanish_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `users`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_world`
--

CREATE TABLE `user_world` (
  `id` int(11) NOT NULL,
  `nick` varchar(255) COLLATE utf8_spanish_ci NOT NULL,
  `world` int(11) NOT NULL,
  `accepted` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `user_world`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `versions`
--

CREATE TABLE `versions` (
  `id` int(11) NOT NULL,
  `version` varchar(255) COLLATE utf8_spanish_ci NOT NULL,
  `releaseNotes` mediumtext COLLATE utf8_spanish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `versions`
--

INSERT INTO `versions` (`id`, `version`, `releaseNotes`) VALUES
(1, '0.9-ALFA', 'First Version.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `worlds`
--

CREATE TABLE `worlds` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8_spanish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `worlds`
--

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `coordinates`
--
ALTER TABLE `coordinates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indices de la tabla `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `world` (`world`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `user_world`
--
ALTER TABLE `user_world`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `versions`
--
ALTER TABLE `versions`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `worlds`
--
ALTER TABLE `worlds`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `coordinates`
--
ALTER TABLE `coordinates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;
--
-- AUTO_INCREMENT de la tabla `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;
--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
--
-- AUTO_INCREMENT de la tabla `user_world`
--
ALTER TABLE `user_world`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;
--
-- AUTO_INCREMENT de la tabla `versions`
--
ALTER TABLE `versions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT de la tabla `worlds`
--
ALTER TABLE `worlds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `coordinates`
--
ALTER TABLE `coordinates`
  ADD CONSTRAINT `coordinates_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`);

--
-- Filtros para la tabla `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`world`) REFERENCES `worlds` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

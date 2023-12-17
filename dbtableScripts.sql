CREATE TABLE `sustainablestocks`.`tickerlist` (
  `tickerid` VARCHAR(10) NOT NULL,
  `tickername` VARCHAR(45) NULL,
  `regionid` INT NULL,
  PRIMARY KEY (`tickerid`),
  INDEX `regionid_idx` (`regionid` ASC) VISIBLE,
  CONSTRAINT `regionid`
    FOREIGN KEY (`regionid`)
    REFERENCES `sustainablestocks`.`region` (`regionid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `sustainablestocks`.`energylist` (
  `energyid` INT NOT NULL,
  `energysource` VARCHAR(45) NULL,
  PRIMARY KEY (`energyid`));

CREATE TABLE `sustainablestocks`.`region` (
  `regionid` INT NOT NULL,
  `continent` VARCHAR(45) NULL,
  PRIMARY KEY (`regionid`));

CREATE TABLE `sustainablestocks`.`userdetails` (
  `username` VARCHAR(20) NOT NULL,
  `password` VARCHAR(30) NULL,
  PRIMARY KEY (`username`));

CREATE TABLE `sustainablestocks`.`energytickertbl` (
  `tickerid` VARCHAR(10) NOT NULL,
  `energyid` INT NOT NULL,
  PRIMARY KEY (`tickerid`, `energyid`),
  INDEX `energyid_idx` (`energyid` ASC) VISIBLE,
  CONSTRAINT `tickerid`
    FOREIGN KEY (`tickerid`)
    REFERENCES `sustainablestocks`.`tickerlist` (`tickerid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `energyid`
    FOREIGN KEY (`energyid`)
    REFERENCES `sustainablestocks`.`energylist` (`energyid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `sustainablestocks`.`tickerdata` (
  `tickerid` VARCHAR(10) NOT NULL,
  `date` DATETIME NOT NULL,
  `open` FLOAT NULL,
  `high` FLOAT NULL,
  `low` FLOAT NULL,
  `close` FLOAT NULL,
  `volume` FLOAT NULL,
  PRIMARY KEY (`tickerid`, `date`),
  CONSTRAINT `fk_tickerdata_tickerid`
    FOREIGN KEY (`tickerid`)
    REFERENCES `sustainablestocks`.`tickerlist` (`tickerid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);
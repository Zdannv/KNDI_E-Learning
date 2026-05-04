package repository

import "errors"

/* ErrorNotFound is used for returned by any repository when row does not exist */
var ErrorNotFound = errors.New("Record Not Found")
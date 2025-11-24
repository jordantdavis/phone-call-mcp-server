package clients

type CallStarter interface {
	StartCall(phoneNumber string) (string, error)
}

type CallEnder interface {
	EndCall(callId string) error
}

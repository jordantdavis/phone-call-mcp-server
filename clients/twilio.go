package clients

import (
	"errors"
	"fmt"
	"log"
	"os"
	"strings"

	twilio "github.com/twilio/twilio-go"
	twilioApi "github.com/twilio/twilio-go/rest/api/v2010"
)

var (
	accountSid = getEnvValueOrExit("TWILIO_ACCOUNT_SID")
	authToken  = getEnvValueOrExit("TWILIO_AUTH_TOKEN")
	// TODO: validate as phone number
	fromNumber = getEnvValueOrExit("TWILIO_FROM_NUMBER")
)

type TwilioClient struct {
	client *twilio.RestClient
}

func NewTwilioClient() *TwilioClient {
	twilioRestClient := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: accountSid,
		Password: authToken,
	})

	return &TwilioClient{
		client: twilioRestClient,
	}
}

func (c *TwilioClient) StartCall(toNumber string, dtfmSeq *string) (string, error) {
	// TODO: validate toNumber as phone number

	params := &twilioApi.CreateCallParams{}
	params.SetTo(toNumber)
	params.SetFrom(fromNumber)
	params.SetUrl("http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient")

	digits, err := adaptDtfmSequence(dtfmSeq)
	if err != nil {
		errorMessage := fmt.Sprintf("TwilioClient#StartCall | Failed to adapter DTFM sequence %s.", *dtfmSeq)
		return "", errors.New(errorMessage)
	}

	if digits != nil {
		params.SetSendDigits(*digits)
	}

	resp, err := c.client.Api.CreateCall(params)

	return *resp.Sid, err
}

func (c *TwilioClient) EndCall(callId string) error {
	params := &twilioApi.UpdateCallParams{}
	params.SetStatus("completed")

	_, err := c.client.Api.UpdateCall(callId, params)

	return err
}

func getEnvValueOrExit(key string) string {
	value, present := os.LookupEnv(key)

	if !present {
		log.Fatalf("Error: Required key %s not set.", key)
	}

	return value
}

func adaptDtfmSequence(dtfmSeq *string) (*string, error) {
	if dtfmSeq == nil {
		return nil, nil
	}

	splitSeq := strings.Split(*dtfmSeq, ",")
	joinedSeq := strings.Join(splitSeq, "")

	return &joinedSeq, nil
}

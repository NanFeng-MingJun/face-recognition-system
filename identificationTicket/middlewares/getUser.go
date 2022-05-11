package middlewares

import (
	"encoding/base64"
	"encoding/json"
	"strings"

	"github.com/kataras/iris/v12"
)

func GetUser(ctx iris.Context) {
	authorization := ctx.GetHeader("authorization")
	token := strings.Split(authorization, " ")[1]
	body64 := strings.Split(token, ".")[1]
	bodyByte, _ := base64.StdEncoding.DecodeString(body64 + "==")

	body := map[string]interface{}{}
	json.Unmarshal(bodyByte, &body)

	ctx.Values().Set("organization", body["organization"].(string))
	ctx.Next()
}

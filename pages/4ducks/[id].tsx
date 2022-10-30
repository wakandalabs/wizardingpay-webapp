import Layout from "../../components/layout";
import {
  Heading,
  HStack, Link,
  Spacer,
  Stack,
  Text, chakra,
} from "@chakra-ui/react";
import {useAccount, useBalance, useContractEvent, useContractReads, useEnsName, useNetwork} from "wagmi";
import {useEffect, useMemo, useState} from "react";
import FourDucksStake from "../../components/FourDucksStake";
import FourDucksSetting from "../../components/FourDucksSetting";
import {FOUR_DUCKS_ADDRESS} from "../../constant/address";
import FOUR_DUCKS_API from "../../abis/FourDucks.json";
import {BigNumber, ethers} from "ethers";
import {useRouter} from "next/router";
import {isAddress} from "ethers/lib/utils";

const _4Ducks = () => {
  const [poolId, setPoolId] = useState("")
  const {address} = useAccount()
  const {chain, chains} = useNetwork()
  const router = useRouter()
  const {data: poolEnsName} = useEnsName({
    address: poolId
  })
  const FourDucksContract = {
    addressOrName: FOUR_DUCKS_ADDRESS[chain?.id || 5],
    contractInterface: FOUR_DUCKS_API,
  }
  const {data} = useContractReads({
    contracts: [
      {
        ...FourDucksContract,
        functionName: 'owner',
      },
      {
        ...FourDucksContract,
        functionName: 'sponsorWallet',
      },
      {
        ...FourDucksContract,
        functionName: 'poolConfigOf',
        args: [poolId],
      }
    ]
  })
  const [sponsorWallet, setSponsorWallet] = useState<string | undefined>(undefined)
  const {data: sponsorWalletData} = useBalance({
    addressOrName: sponsorWallet,
  })
  const [ducks, setDucks] = useState<any[]>([])

  useEffect(() => {
    if (data?.[1]) {
      setSponsorWallet(data?.[1].toString())
    }
  }, [data])

  useEffect(() => {
    if (router.query.id && isAddress(router.query.id.toString())) {
      setPoolId(router.query.id.toString())
    } else {
      if (address) {
        setPoolId(address)
      }
    }
  }, [address, router])

  const etherscanUrl = useMemo(() => {
    if (chain) {
      return chain?.blockExplorers?.etherscan?.url
    }
    if (chains) {
      return chains?.[0]?.blockExplorers?.etherscan?.url
    }
  }, [chain, chains])

  useEffect(() => {
    let response = BigNumber.from("0x6dc39940ec90861d7cf7ae34872eae08c3d204054bca24ac64f38f3fafa40ef7")
    let array = []
    for (let i = 0; i < 4; i++) {
      let arr = []
      arr.push(response.and(BigNumber.from("0xffffffff")).toNumber() / BigNumber.from("0x100000000").toNumber())
      response = response.shr(32)
      arr.push(response.and(BigNumber.from("0xffffffff")).toNumber() / BigNumber.from("0x100000000").toNumber())
      array.push(arr)
    }
    setDucks(array)
  }, [])

  return (
    <Layout>
      <HStack w={'full'} h={'full'} alignItems={"start"}>
        <Stack p={'24px'} w={'full'} alignItems={"center"} spacing={'48px'}>
          <HStack w={'full'} spacing={'24px'}>
            <Heading fontWeight={'bold'} cursor={'pointer'} onClick={() => {
              router.push('/4ducks/')
            }}>4 Ducks</Heading>
            {sponsorWalletData && (
              <Link href={`${etherscanUrl}/address/${sponsorWallet}`} isExternal
                    fontSize={'sm'}>sponsor
                balance: {Number(ethers.utils.formatUnits(sponsorWalletData.value, sponsorWalletData.decimals)).toLocaleString()} {sponsorWalletData.symbol}</Link>
            )}
            <Spacer/>
            {chain && poolId && (
              <Link href={`${chain?.blockExplorers?.etherscan?.url}/address/${FOUR_DUCKS_ADDRESS[chain?.id || 5]}`}
                    isExternal fontSize={'sm'}>the pool: {poolEnsName ? poolEnsName : poolId}</Link>
            )}
            {
              data?.[0] === address && (
                <FourDucksSetting/>
              )
            }
          </HStack>
          <HStack justify={"space-around"} w={'full'}>
            <FourDucksStake label={"Yes"} poolId={poolId} isOptimistic={true}/>
            <Stack bgImage={'/pool.svg'} w={'600px'} h={'600px'} bgPosition={"center"} bgSize={'contain'}
                   position={"relative"} spacing={0}>
              {
                ducks.map((duck, index) => (
                  <chakra.img
                    key={index}
                    src={'/duck.svg'}
                    w={'44px'} h={'44px'}
                    position={"absolute"}
                    top={`calc(50% - ${Math.sin(duck[1] * 2 * Math.PI)} * ${260 * duck[0]}px)`}
                    left={`calc(50% - ${Math.cos(duck[1] * 2 * Math.PI)} * ${260 * duck[0]}px)`}
                    transform={'translate(-50%, -50%)'}
                  />
                ))
              }
            </Stack>
            <FourDucksStake label={"No"} poolId={poolId} isOptimistic={false}/>
          </HStack>
        </Stack>
        <Stack minW={'300px'} h={'full'} bg={"gray.50"} p={'12px'}>
          <Text>Join other pools:</Text>
        </Stack>
      </HStack>
    </Layout>
  );
}

export default _4Ducks;